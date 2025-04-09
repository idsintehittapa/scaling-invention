import Hero from "./components/Hero";
import Introdcution from "./components/Introdcution";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client";
import Calendar from "./components/Calendar";

function App() {
  return (
    <ApolloProvider client={client}>
      <main>
        <Hero />
        <Introdcution />
        <Calendar />
      </main>
    </ApolloProvider>
  );
}

export default App;
