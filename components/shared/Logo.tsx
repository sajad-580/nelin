import Link from "next/link";
import config from "../../config";
import ImageComponent from "./image-component";

const Logo = ({ w, h = 75 }) => {
  return (
    <Link href="/" className="text-gray">
      <div className="d-inline-block text-center">
        <ImageComponent
          src={`/images/logo/${process.env.NEXT_PUBLIC_LOGO}`}
          layout="fixed"
          width={w}
          height={h}
          alt={process.env.NEXT_PUBLIC_DOMAIN}
        />
        <h6
          className={"d-none d-md-block d-lg-block mb-0"}
          style={{ fontSize: "0.8rem" }}
        >
          نسخه
          <span className={"me-2"}>{config.version}</span>
        </h6>
      </div>
    </Link>
  );
};

export default Logo;
