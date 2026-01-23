import { generateStaticParamsFor, importPage } from "nextra/pages";
import { RootPageWrapper } from "../../components/root-page-wrapper";
import { useMDXComponents as getMDXComponents } from "../../mdx-components";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props) {
  const params = await props.params;

  if (!params.mdxPath || params.mdxPath.length === 0) {
    return {
      title: "DogeOS SDK",
      description: "A comprehensive wallet connection SDK with React hooks and modal support",
    };
  }

  const pathStr = Array.isArray(params.mdxPath) ? params.mdxPath.join("/") : params.mdxPath;
  if (pathStr.startsWith("_") || pathStr === "_global-error") {
    return {};
  }

  if (pathStr.includes(".") && !pathStr.endsWith(".mdx") && !pathStr.endsWith(".md")) {
    return {};
  }

  try {
    const { metadata } = await importPage(params.mdxPath);
    return metadata;
  } catch (error) {
    return {};
  }
}

const components = getMDXComponents({});
const Wrapper = components.wrapper || (({ children }) => <>{children}</>);

export default async function Page(props) {
  const params = await props.params;

  if (!params.mdxPath || params.mdxPath.length === 0) {
    return <RootPageWrapper />;
  }

  const pathStr = Array.isArray(params.mdxPath) ? params.mdxPath.join("/") : params.mdxPath;
  if (pathStr.startsWith("_") || pathStr === "_global-error") {
    return null;
  }

  if (pathStr.includes(".") && !pathStr.endsWith(".mdx") && !pathStr.endsWith(".md")) {
    return null;
  }

  try {
    const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath);
    return (
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent {...props} params={params} />
      </Wrapper>
    );
  } catch (error) {
    console.error("Error loading page:", error);
    return null;
  }
}
