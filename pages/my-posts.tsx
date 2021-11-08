import Link from "next/link";
import { useEffect, useState } from "react";
import { API, Auth, Storage } from "aws-amplify";
import { Post } from "../models/post";
import { postsByUsername } from "../graphql/queries";
import { deletePost as deletePostMutation } from "../graphql/mutations";

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { username } = await Auth.currentAuthenticatedUser();
    const postData = await API.graphql({
      query: postsByUsername,
      variables: { username },
    });
    setPosts(postData.data.postsByUsername.items);
  }

  async function deletePost(id: string) {
    const { data } = await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const deleteImage = await Storage.remove(id);

    console.log(`${data} + ${deleteImage} post deleted successfully.`);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((post) => (
        <div key={post.id} className="border-b border-gray-300 mt-8 pb-4">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-gray-500 mt-2">Author: {post.username}</p>
          <Link href={`/edit-post/${post.id}`}>
            <a className="text-sm mr-4 text-blue-500">Edit Post</a>
          </Link>
          <Link href={`/posts/${post.id}`}>
            <a className="text-sm mr-4 text-blue-500">View Post</a>
          </Link>
          <button
            className="text-sm mr-4 text-red-500"
            onClick={() => deletePost(post.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
