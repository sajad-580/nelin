import { Col } from "antd";
import color from "color";
import { useRouter } from "next/router";

const RenderCats = ({ data }) => {
    const router = useRouter();
    const handleClick = (item) => {
        router.push(`/${Number(item.parent_id)}/${item._id}`);
    }
    return [
        <>
            {
                data?.length ?
                    data.map((item, key) => (
                        <Col lg={8} md={8} sm={24} xs={24}
                            className="cat-item pointer" style={color['catCss']}
                            onClick={() => handleClick(item)}>
                            <div>
                                <div className="d-flex gap-1">
                                    <span className="">{++key}</span>
                                    <span className="">|</span>
                                    <span>{item['name']}</span>
                                </div>
                            </div>
                        </Col>
                    )) : ''
            }
        </>
    ]
}
export default RenderCats;
