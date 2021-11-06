import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import SimpleMDE from "react-simplemde-editor";
import { useRouter } from "next/router";
import "easymde/dist/easymde.min.css";
import { getPost } from "../../graphql/queries";
import { updatePost } from "../../graphql/mutations";
import type { Post } from "../../models/post";

function EditPost() {
  const [post, setPost] = useState<Post>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    fetchPost();

    async function fetchPost() {
      if (!id) return;

      const postData = await API.graphql({ query: getPost, variables: { id } });
      setPost(postData.data.getPost);
    }
  }, [id]);

  if (!post) return null;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }

  const { title, content } = post;

  async function updateCurrentPost() {
    if (!title || !content) return;

    await API.graphql({
      query: updatePost,
      variables: { input: { title, content, id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    console.log("post successfully updated!");
    router.push("/my-posts");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">Edit Post</h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMDE
        value={content}
        onChange={(value) => setPost({ ...post, content: value })}
      />

      <button
        type="button"
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
        onClick={updateCurrentPost}
      >
        Update Post
      </button>
    </div>
  );
}

export default EditPost;
