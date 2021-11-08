import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { GetStaticProps, GetStaticPaths } from "next";
import { API, Storage } from "aws-amplify";
import ReactMarkdown from "react-markdown";
import { listPosts, getPost } from "../../graphql/queries";
import type { Post as PostModel } from "../../models/post";

export default function Post({ post }: { post: PostModel }) {
  const [newCoverImage, setNewCoverImage] = useState(null);

  useEffect(() => {
    updateCoverImage();
  });
  async function updateCoverImage() {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      console.log("imageKey ", imageKey);

      setNewCoverImage(imageKey);

      console.log(newCoverImage);
    }
  }

  console.log(post);

  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl mt-4 mb-4 font-semibold tracking-wide">
        {post.title}
      </h1>
      {newCoverImage && (
        <Image
          src={newCoverImage}
          className="mt-4"
          alt="cover image for the post"
          width={800}
          height={500}
          layout="fixed"
        />
      )}
      <p className="text-sm font-light my-4">by {post.username}</p>
      <div className="mt-8">
        <ReactMarkdown className="prose">{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const postData = await API.graphql({
    query: listPosts,
  });

  const paths = postData.data.listPosts.items.map((post: { id: string }) => ({
    params: {
      id: post.id,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{ post: PostModel }> = async ({
  params,
}) => {
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });

  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 60,
  };
};
