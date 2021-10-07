import { withAuthenticator } from "@aws-amplify/ui-react";
import { useState } from "react";
import { API } from "aws-amplify";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/router";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { createPost } from "../graphql/mutations";
import { Post } from "../models/post";

const initialState: Post = {
  title: "",
  content: "",
};

function CreatePost() {
  const [post, setPost] = useState<Post>(initialState);
  const { title, content } = post;
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }

  async function createNewPost() {
    if (!post.title || !post.content) return;
    const id: string = uuid();
    post.id = id;

    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    router.push(`/posts/${post.id}`);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">
        Create new post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMDE
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />

      <button
        type="button"
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        onClick={createNewPost}
      >
        Create Post
      </button>
    </div>
  );
}

export default withAuthenticator(CreatePost);
