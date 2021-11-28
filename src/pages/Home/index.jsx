import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="divHome">
      <Link to="/pres">
        <h1>Lhotka Game Night</h1>
      </Link>
    </div>
  );
}

export default Home;
