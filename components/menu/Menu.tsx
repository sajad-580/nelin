import { Row } from "antd";
import { useProductContext } from "components/Products";
import { getMenu } from "helpers/helper";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { request } from "util/util";
import RenderCats from "./RenderCats";
import RenderItems from "./RenderItems";
import { useCartContext } from "components/CartProvider";




const Menu = ({ title }) => {
    const { token, interval } = useProductContext();
    const { openSidebar } = useCartContext();
    const [items, setItems] = useState({})
    const [children, setChildren] = useState({})
    const [parents, setParents] = useState([])
    const router = useRouter();
    const isMainPage = router.query.parentId ? false : true;
    const getData = async () => {
        let data: any = await request('/api/menu', 'POST', {
            find: 1,
        });
        if (!data?.length) {
            data = await getMenu(token);
        }
        let arr = [];
        let items: any = {};
        let children = [];
        for (const item of data) {
            if (!item['parent_id']) arr.push(item);
            else children.push(item);
            items[item['_id']] = item['items'];
        }
        setParents(arr)
        setItems(items)
        setChildren(children)
        interval();
    }


    useEffect(() => {
        if (token)
            getData();
    }, [router, token]);

    const onBack = () => {
        router.back();
    };



    return (
        <div className={` ${openSidebar ? 'open_sidebar p-2' : 'container-fluid'}`}>
            {!isMainPage && (
                <div className="flex w-100 gap-4 pe-4 mb-4 text-yellow">
                    <p style={{ fontSize: "0.8rem" }}>
                        <Link href="/">
                            <span className="cursor-pointer">بازگشت</span>
                        </Link>
                    </p>
                    <p style={{ fontSize: "0.8rem" }}>
                        <a className="pr-8 cursor-pointer" onClick={onBack}>
                            صفحه قبل
                        </a>
                    </p>
                </div>
            )}
            <div className="mt-4 mb-5">
                <Row>
                    <RenderCats data={parents} />
                </Row>
                <Row className="mt-5">
                    <RenderItems items={items} children={children} />
                </Row>
            </div>
        </div>
    );
};

export default Menu;
