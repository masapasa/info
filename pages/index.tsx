import Link from "next/link";
import { API, Storage } from "aws-amplify";
import { useEffect, useState } from "react";
import { listPosts } from "../graphql/queries";
import { Post } from "../models/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const postData = await API.graphql({
      query: listPosts,
    });

    const { items } = postData.data.listPosts;

    // Fetch images from S3 for posts that contain a cover image
    const postsWithImages: Post[] = await Promise.all(
      items.map(async (post) => {
        if (post.coverImage) {
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    );

    console.log("posts", postsWithImages);
    setPosts(postsWithImages);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Posts</h1>
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <a>
            <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-500 mt-2">Author: {post.username}</p>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}
