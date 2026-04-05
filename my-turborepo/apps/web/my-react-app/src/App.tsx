import React, { useEffect, useState } from "react";
import keycloak from "./keyclock";

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: "login-required" }).then((auth) => {
      setAuthenticated(auth);
    });
  }, []);

  if (!authenticated) return <div>Loading...</div>;

  return <h1>Logged in ✅</h1>;
}

export default App;