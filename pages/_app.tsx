import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Auth, Hub } from "aws-amplify";
import "../configureAmplify";
import "../styles/global.css";
import "tailwindcss/tailwind.css";
import "easymde/dist/easymde.min.css";
import "codemirror/lib/codemirror.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [signedInUser, setSignedInUser] = useState(false);

  useEffect(() => {
    authListener();
  }, []);

  async function authListener() {
    Hub.listen("auth", (data) => {
      if (data.payload.event === "signIn") {
        return setSignedInUser(true);
      }

      if (data.payload.event === "signOut") {
        return setSignedInUser(false);
      }
    });

    try {
      await Auth.currentAuthenticatedUser();
      setSignedInUser(true);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <nav className="p-6 border-b border-gray-300">
        <Link href="/">
          <a className="mr-6 cursor-pointer">Home</a>
        </Link>
        <Link href="/create-post">
          <a className="mr-6 cursor-pointer">Create Post</a>
        </Link>
        <Link href="/profile">
          <a className="mr-6 cursor-pointer">Profile</a>
        </Link>
        {signedInUser && (
          <Link href="/my-posts">
            <a className="mr-5 cursor-pointer">My Posts</a>
          </Link>
        )}
      </nav>

      <div className="py-8 px-16">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
