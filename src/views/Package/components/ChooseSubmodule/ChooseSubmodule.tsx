import { ArrowBackIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Divider, Stack, useDisclosure } from "@chakra-ui/react";
import type { Assembly } from "jsii-reflect";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { QUERY_PARAMS } from "../../../../constants/url";
import { useQueryParams } from "../../../../hooks/useQueryParams";
import { SearchModal } from "./SearchModal";

export interface ChooseSubmoduleProps {
  assembly?: Assembly;
}

export const ChooseSubmodule: FunctionComponent<ChooseSubmoduleProps> = ({
  assembly,
}) => {
  const { pathname } = useLocation();
  const { push } = useHistory();
  const query = useQueryParams();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentSubmodule = query.get(QUERY_PARAMS.SUBMODULE);
  const submoduleText = currentSubmodule
    ? `Submodule: ${currentSubmodule}`
    : "Choose Submodule";

  const [filter, setFilter] = useState("");

  const onGoBack = () => {
    const lang = query.get(QUERY_PARAMS.LANGUAGE);
    push(`${pathname}${lang ? `?${QUERY_PARAMS.LANGUAGE}=${lang}` : ""}`);
  };

  const getUrl = useCallback(
    (submoduleName: string) => {
      const params = new URLSearchParams(query.toString());
      params.set("submodule", submoduleName);
      return `${pathname}?${params}`;
    },
    [pathname, query]
  );

  const submodules = useMemo(() => {
    let results = assembly?.submodules ?? [];

    if (filter) {
      results = results.filter(({ name }) =>
        name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return results.map(({ name }) => ({
      name,
      to: getUrl(name),
    }));
  }, [assembly?.submodules, filter, getUrl]);

  return (
    <Stack spacing={4} w="100%">
      {currentSubmodule && (
        <>
          <Button
            borderRadius="none"
            data-testid="choose-submodule-go-back"
            leftIcon={<ArrowBackIcon aria-label="Back to construct root" />}
            onClick={onGoBack}
            title="Back to construct root"
            variant="link"
          >
            {assembly?.name}
          </Button>
          <Divider />
        </>
      )}
      <Button
        borderRadius="none"
        color="blue.500"
        data-testid="choose-submodule-search-trigger"
        disabled={!assembly?.submodules.length}
        flexGrow={1}
        onClick={onOpen}
        rightIcon={<ChevronDownIcon />}
        title="Choose Submodule"
        variant="link"
      >
        {submoduleText}
      </Button>
      <SearchModal
        inputValue={filter}
        isOpen={isOpen}
        onClose={onClose}
        onInputChange={setFilter}
        submodules={submodules}
      />
    </Stack>
  );
};
