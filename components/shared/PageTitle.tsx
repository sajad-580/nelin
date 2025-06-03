import React, { PropsWithChildren, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

interface Props extends PropsWithChildren<{}> {}

const PageTitle = (props: Props) => {
  const { children } = props;
  const title = children || "";

  return (
    <Head>
      <title>
        {title}
        {title ? " - " : ""}
        {process.env.NEXT_PUBLIC_TITLE}
      </title>
    </Head>
  );
};

export default PageTitle;
