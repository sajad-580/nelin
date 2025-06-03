import Document, { Head, Html, Main, NextScript } from "next/document";
import config from "config";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="fa" dir="rtl" data-theme={config.defaultTheme}>
        <Head>
          <meta charSet="utf8" />
          {/* <!-- DNS prefetch --> */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`/images/logo/${process.env.NEXT_PUBLIC_LOGO}`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={`/images/logo/${process.env.NEXT_PUBLIC_LOGO}`}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={`/images/logo/${process.env.NEXT_PUBLIC_LOGO}`}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
