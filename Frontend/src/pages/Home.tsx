import { Link } from "react-router-dom";

export const Home = () => {

  return (
    <>
      <p>Chess Image </p>
     
      <Link to={"game"}>
        <button >Join Room</button>
      </Link>
    </>
  );
};
