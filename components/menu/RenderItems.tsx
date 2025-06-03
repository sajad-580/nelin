import { PlusCircleOutlined } from "@ant-design/icons";
import { Badge, Col } from "antd";
import color from "color";
import { useRouter } from "next/router";
import RenderCats from "./RenderCats";
import RenderOption from "./RenderOption";
import { useCartContext } from "components/CartProvider";

const RenderItems = ({ items, children }) => {
    const { addToCart, cart } = useCartContext();
    const router = useRouter();
    let parentId = Number(router.query.id);
    if (!parentId) return true;
    let child = [];
    const showCount = (id) => {
        let qty = 0;
        for (const item of cart) {
            if (item['id'] == id)
                qty += item['qty'];
        }
        return qty;
    }
    if (children?.length) {
        for (const c of children) {
            if (c['parent_id'] == parentId)
                child.push(c);
        }
    }
    items = items[parentId];
    let count = child.length;
    return <>
        <RenderCats data={child} />
        {
            items?.length ? items.map(item => (
                <Col lg={8} md={8} sm={24} xs={24} className=" cat-item pointer"
                    style={color['itemCss']}
                // onClick={() => addToCart(item)}
                >
                    <div>
                        <div className="d-flex gap-1 justify-between" onClick={() => addToCart(item)}>
                            <div className="d-flex gap-1">
                                <span className="">{++count}</span>
                                <span className="">|</span>
                                <span>{item['name']} <Badge count={showCount(item['id'])} /></span>
                            </div>
                            <div className="d-flex gap-3">
                                <RenderOption data={item['option']} item={item} />
                                {
                                    item['show_discount'] ?
                                        <>
                                            <del className="badge font-09" style={color['priceCss']}>{item['original_price']}</del>
                                            <div className="badge font-09" style={color['priceCss']}>{item['price']}</div>
                                        </>
                                        :
                                        <div className="badge font-09" style={color['priceCss']}>{item['price']}</div>
                                }
                                <PlusCircleOutlined className="font-09 addToCart hover-yellow"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item)
                                    }} />
                            </div>

                        </div>
                    </div>
                </Col>
            )) : ""
        }
    </>;
}
export default RenderItems;