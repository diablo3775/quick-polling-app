import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../config/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// Fetch IP Address
const getIPAddress = async () => {
  const response = await fetch("https://api64.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
};

const VotePoll = ({ pollId }) => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  // ✅ Fetch poll data
  const { data: poll, isLoading, isError } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      const pollSnap = await getDoc(doc(db, "polls", pollId));
      if (!pollSnap.exists()) throw new Error("Poll not found");
      return pollSnap.data();
    },
    refetchInterval: 5000,
  });

  // ✅ Check if this IP has already voted
  const { data: hasVoted } = useQuery({
    queryKey: ["hasVoted", pollId],
    queryFn: async () => {
      const ipAddress = await getIPAddress();
      const voteSnap = await getDoc(doc(db, "polls", pollId, "votes", ipAddress));
      return voteSnap.exists(); // Returns true if IP already voted
    },
  });

  // ✅ Handle username submission and save user info
  const handleUsernameSubmit = async () => {
    if (!username.trim()) return alert("Please enter your name.");
    const ipAddress = await getIPAddress();
    
    if (hasVoted) {
      return alert("You have already voted!");
    }

    const newUserId = uuidv4();

    // Store user details in Firestore
    await setDoc(doc(db, "polls", pollId, "voters", newUserId), {
      username,
      ip: ipAddress,
    });

    setUserId(newUserId);
  };

  // ✅ Mutation for voting
  const voteMutation = useMutation({
    mutationFn: async (option) => {
      const ipAddress = await getIPAddress();

      // Double-check if this IP has already voted before proceeding
      const existingVoteSnap = await getDoc(doc(db, "polls", pollId, "votes", ipAddress));
      if (existingVoteSnap.exists()) {
        throw new Error("You have already voted from this device/IP!");
      }

      const pollRef = doc(db, "polls", pollId);
      const pollSnap = await getDoc(pollRef);
      if (!pollSnap.exists()) throw new Error("Poll not found");

      const updatedOptions = {
        ...pollSnap.data().options,
        [option]: pollSnap.data().options[option] + 1,
      };

      await updateDoc(pollRef, { options: updatedOptions });

      // ✅ Store vote with IP in Firestore
      await setDoc(doc(db, "polls", pollId, "votes", ipAddress), {
        username,
        option,
        ip: ipAddress,
      });

      return updatedOptions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["poll", pollId]);
      queryClient.invalidateQueries(["hasVoted", pollId]);
    },
  });

  const handleVote = () => {
    if (!selectedOption) return alert("Please select an option.");
    if (!userId) return alert("Please enter your name first.");
    if (hasVoted) return alert("You have already voted from this device/IP!");

    voteMutation.mutate(selectedOption);
  };

  if (isLoading) return <p>Loading poll...</p>;
  if (isError) return <p>Error loading poll.</p>;

  return (
    <div>
      {!userId ? (
        <div>
          <h2>Enter your name to vote:</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Name"
          />
          <button onClick={handleUsernameSubmit}>Continue</button>
        </div>
      ) : (
        <div>
          <h2>{poll.question}</h2>
          {Object.keys(poll.options).map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="vote"
                value={option}
                onChange={() => setSelectedOption(option)}
                disabled={!!hasVoted} // Disable if IP already voted
              />
              {option} ({poll.options[option]} votes)
            </label>
          ))}
          <button onClick={handleVote} disabled={!!hasVoted || voteMutation.isLoading}>
            {hasVoted ? "You have already voted" : voteMutation.isLoading ? "Submitting..." : "Vote"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VotePoll;
