import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreatePoll from "./components/CreatePoll";
import VotePoll from "./components/VotePoll";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/vote/:pollId" element={<VotePollWrapper />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

// Wrappers to extract pollId from URL params
import { useParams } from "react-router-dom";
const VotePollWrapper = () => {
  const { pollId } = useParams();
  return <VotePoll pollId={pollId} />;
};

export default App;
