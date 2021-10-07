import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { API } from "@aws-amplify/api";
import ReactMarkdown from "react-markdown";
import { listPosts, getPost } from "../../graphql/queries";

export default function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracking-wide">
        {post.title}
      </h1>
      <p className="text-sm font-light my-4">by {post.username}</p>
      <div className="mt-8">
        <ReactMarkdown className="prose" children={post.content} />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const postData = await API.graphql({
    query: listPosts,
  });

  console.log("postData", postData);

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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });

  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 1,
  };
};
