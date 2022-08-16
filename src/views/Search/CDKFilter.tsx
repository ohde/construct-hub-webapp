import { FunctionComponent, useMemo } from "react";
import { CatalogConstructFrameworkMeta } from "../../api/catalog-search";
import { CDKType, CDKTYPE_NAME_MAP } from "../../constants/constructs";
import { useSearchContext } from "../../contexts/Search";
import { RadioFilter } from "./RadioFilter";
import testIds from "./testIds";
import { useCdkMajor, useCdkType } from "./useSearchParam";
import { useUpdateSearchParam } from "./useUpdateSearchParam";

type CDKOptions = Partial<{
  [key in CDKType]: CatalogConstructFrameworkMeta & {
    display: string;
    value: key;
  };
}>;

export const CDKFilter: FunctionComponent = () => {
  const cdkType = useCdkType();
  const cdkMajor = useCdkMajor();

  const updateSearch = useUpdateSearchParam();

  const searchAPI = useSearchContext()!;

  // Options with less than one package will be omitted
  const cdkOptions = useMemo(() => {
    const cdkTypes = searchAPI.constructFrameworks;
    const options = Object.entries(cdkTypes).reduce((opts, [name, meta]) => {
      if (meta.pkgCount < 1) {
        return opts;
      }

      return {
        ...opts,
        [name]: {
          display: CDKTYPE_NAME_MAP[name as CDKType],
          value: name,
          ...meta,
        },
      };
    }, {});

    return Object.keys(options).length ? (options as CDKOptions) : undefined;
  }, [searchAPI]);

  const majorsOptions = useMemo(() => {
    if (!cdkOptions || !cdkType) return undefined;
    const majorVersions = cdkOptions[cdkType]?.majorVersions;

    if (!majorVersions) return undefined;

    return [...majorVersions]
      .sort((a, b) => a - b)
      .map((value) => ({
        value: value.toString(),
        display: `${CDKTYPE_NAME_MAP[cdkType]} v${value}`,
      }));
  }, [cdkOptions, cdkType]);

  if (!cdkOptions) {
    return null;
  }

  const onCdkTypeChange = (type: string) => {
    const cdk = type as CDKType;
    updateSearch({ cdkType: type ? cdk : undefined, cdkMajor: undefined });
  };

  const onCdkMajorChange = (major: string) => {
    let majorNum: number | undefined = undefined;

    if (major) {
      majorNum = parseInt(major, 10);
    }

    updateSearch({ cdkMajor: majorNum });
  };

  return (
    <>
      <RadioFilter
        data-testid={testIds.cdkTypeFilter}
        hint="Choose the right CDK for your IaC technology: AWS CDK for AWS CloudFormation, CDKTF for Terraform, or CDK8s for Kubernetes."
        name="CDK Type"
        onValueChange={onCdkTypeChange}
        options={[
          { display: "Any CDK Type", value: "" },
          ...Object.values(cdkOptions),
        ]}
        value={cdkType ?? ""}
      />
      {/* No point in showing major versions if only a single one is available */}
      {!!(majorsOptions && majorsOptions.length > 1) && (
        <RadioFilter
          data-testid={testIds.cdkVersionFilter}
          hint="Choose the major version of the CDK you're using to see only constructs that will work with that version."
          name="CDK Major Version"
          onValueChange={onCdkMajorChange}
          options={[
            { display: "Any Major Version", value: "" },
            ...majorsOptions,
          ]}
          value={cdkMajor?.toString() ?? ""}
        />
      )}
    </>
  );
};
