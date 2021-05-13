import PackageDetails from "../PackageDetails";

interface PackageDocsHomeProps {
  name: string;
  scope?: string;
  version: string;
}

export default function PackageDocsHome(props: PackageDocsHomeProps) {
  return (
    <>
      <h1>Docs Home</h1>
      <PackageDetails {...props} />
    </>
  );
}
