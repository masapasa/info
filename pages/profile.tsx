import Auth from "@aws-amplify/auth";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { Post } from "../models/post";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const user = await Auth.currentAuthenticatedUser();
    console.log({ user });

    setUser(user);
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
      <h3 className="font-medium text-gray-500 my-2">{user.username}</h3>
      <p className="text-sm text-gray-500 mb-6">{user.attributes.email}</p>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(Profile);
