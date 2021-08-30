import React from 'react';

function App() {
    const [products, setProducts] = useState([])
    const [timeline, setTimeline] = useState([])

    useEffect(() => {
        const fetchAllProducts = async () => {
            const response = await fetch("/product/")
            const fetchedproducts = await response.json()
            setProducts(fetchedproducts)
        }

        const interval = setInterval(fetchAllProducts, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        const timelineItems = products.reverse().map((product) => {
            return product.completed ? (
                <Timeline.Item
                    dot={<CheckCircleOutlined />}
                    color="green"
                    style={{ textDecoration: "line-through", color: "green" }}
                >
                    {product.name} <small>({product._id})</small>
                </Timeline.Item>
            ) : (
                <Timeline.Item
                    dot={<MinusCircleOutlined />}
                    color="blue"
                    style={{ textDecoration: "initial" }}
                >
                    {product.name} <small>({product._id})</small>
                </Timeline.Item>
            )
        })

        setTimeline(timelineItems)
    }, [products])

    return (
        <>
            <Row style={{ marginTop: 50 }}>
                <Col span={14} offset={5}>
                    <Timeline mode="alternate">{timeline}</Timeline>
                </Col>
            </Row>
        </>
    )
}

export default App