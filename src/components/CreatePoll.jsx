import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "../config/firebaseConfig";
import { collection, addDoc, doc, getDoc, getDocs } from "firebase/firestore";

const fetchPoll = async (pollId) => {
  const pollDoc = await getDoc(doc(db, "polls", pollId));
  if (!pollDoc.exists()) throw new Error("Poll not found");
  return { id: pollDoc.id, ...pollDoc.data() };
};

const fetchVotes = async (pollId) => {
  const votesRef = collection(db, "polls", pollId, "votes");
  const votesSnap = await getDocs(votesRef);

  return votesSnap.docs.map((doc) => ({
    ip: doc.id,
    username: doc.data().username || "Anonymous",
    option: doc.data().option,
  }));
};

const PollResults = ({ pollId }) => {
  const { data: poll, error, isLoading } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => fetchPoll(pollId),
    refetchInterval: 5000,
  });

  const { data: votes } = useQuery({
    queryKey: ["votes", pollId],
    queryFn: () => fetchVotes(pollId),
    refetchInterval: 5000,
  });

  if (isLoading) return <p>Loading results...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Results for: {poll.question}</h2>
      {Object.entries(poll.options).map(([option, votes]) => (
        <p key={option}>
          <strong>{option}:</strong> {votes} votes
        </p>
      ))}

      <h3>Voters</h3>
      <ul>
        {votes?.length > 0 ? (
          votes.map((vote) => (
            <div key={vote.ip}>
              <strong>{vote.username}</strong> voted for <em>{vote.option}</em>
            </div>
          ))
        ) : (
          <p>No votes yet.</p>
        )}
      </ul>
    </div>
  );
};

const CreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollId, setPollId] = useState(null);

  const addPollToDB = async () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill in the question and all options.");
      return;
    }

    const formattedOptions = options.reduce((acc, option) => {
      acc[option] = 0;
      return acc;
    }, {});

    try {
      const docRef = await addDoc(collection(db, "polls"), {
        question,
        options: formattedOptions,
      });

      setPollId(docRef.id);
    } catch (error) {
      console.error("Error adding poll:", error);
      alert("Error creating poll. Try again.");
    }
  };

  return (
    <div className="container">
      <h2>Create a Poll</h2>
      <input
        type="text"
        placeholder="Enter poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <h3>Options</h3>
      {options.map((option, index) => (
        <div key={index} className="option-container">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
          />
          <button onClick={() => setOptions(options.filter((_, i) => i !== index))}>
            ❌
          </button>
        </div>
      ))}
      <button onClick={() => setOptions([...options, ""])}>➕ Add Option</button>
      <br />
      <button style={{ marginTop: "10px" }} onClick={addPollToDB}>
        Create Poll
      </button>

      {pollId && (
        <div className="results">
          <p>
            Poll created! Share this link: <a href={`/vote/${pollId}`}>/vote/{pollId}</a>
          </p>
          <PollResults pollId={pollId} />
        </div>
      )}
    </div>
  );
};

export default CreatePoll;
