import { useEffect, useState } from "react";
import axios from "axios";

function App() {
	const [msg, setMsg] = useState("");

	useEffect(() => {
		axios.get("/api/hello").then((res) => {
			setMsg(res.data.message);
		});
	}, []);

	return <h1>{msg || "Loading..."}</h1>;
}

export default App;
