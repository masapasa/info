import { withAuthenticator } from "@aws-amplify/ui-react";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { API, Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import SimpleMDE from "react-simplemde-editor";
import { createPost } from "../graphql/mutations";
import type { Post } from "../models/post";
import dynamic from "next/dynamic";

dynamic(() => import("codemirror/lib/codemirror"), { ssr: false });

const initialState: Post = {
  title: "",
  content: "",
  coverImage: null,
};

function CreatePost() {
  const [post, setPost] = useState<Post>(initialState);
  const [image, setImage] = useState<File>(null);
  const hiddenFileInput = useRef(null);
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }

  async function createNewPost() {
    if (!title || !content) return;
    const id = uuid();
    post.id = id;

    if (image) {
      const fileName = `${image.name}_${uuid()}`;
      console.log(fileName);
      post.coverImage = fileName;
      console.log(post.coverImage);

      try {
        await Storage.put(fileName, image, {
          contentType: "image/png",
        });
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }

    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  }

  console.log("post", post);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;

    setImage(fileUploaded);
  }

  function uploadImage() {
    hiddenFileInput.current.click();
  }

  const { title, content } = post;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">
        Create new post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />

      {image && (
        <Image
          src={URL.createObjectURL(image)}
          alt="cover image for the post"
          className="my-4"
          width={500}
          height={500}
          layout="fixed"
        />
      )}

      <SimpleMDE
        value={content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        className="absolute w-0 h-0"
      />
      <button
        onClick={uploadImage}
        className="bg-purple-600 text-white font-semibold px-8 py-2 rounded-lg mr-2"
      >
        Upload Cover Photo
      </button>

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
