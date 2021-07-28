import { h, Component } from "preact";

export default class BCC_Product extends Component {
  
    initialState = {  };

    constructor(props) {
        super(props);
        this.state = {
            product_id: props.p_id,
            image:null,
            the_product:{},
            name: null,
            sellerName: null,
            price: null,
            condition: '',
            qty: this.props.qty
        }
    }

    componentDidMount() {
        $.ajax({
            type: "GET",
            url: "/api/catalog_system/pub/products/search?fq=productId:" + this.state.product_id,
            contentType: "application/json",
            dataType: "json",
        }).done((response) => {
            this.setState({
                the_product: response[0]
            } , function () {
                this.setState({ 
                    image: this.state.the_product.items[0].images[0].imageUrl, 
                    name: this.state.the_product.productName,
                    sellerName: this.state.the_product.items[0].sellers[0].sellerName,
                    price: new Intl.NumberFormat(["ban", "id"]).format((this.props.priced))
                })
                if (this.state.the_product.Condición) {
                    this.setState({ condition: this.state.the_product.Condición[0] })
                }
            });
        });
  
    }

    componentDidUpdate() {

    }

    render(_, state) {
        const { name, sellerName , price , condition, qty, image } = state;
        return (
            <li>
                <div class="bc-desc-images"><img src={ image } /></div>
                <div class="description-product">
                    <div class="type"> {condition} </div>
                    <div class="product-info">
                        <div class="product_name">
                            <div class="the_title">{name}</div>
                            <div class="small-title">Vende: {sellerName} </div> 
                        </div>
                        <div class="product_qty">
                            <div class="small-title">Cantidad</div><strong>{qty}</strong>
                        </div>
                        <div class="product_price">
                            <div class="small-title">Precio</div><strong>${price}</strong>
                        </div>
                        <div class="product_state"> <strong>Vehiculo Seperado </strong><i class="icon-check"></i></div>
                    </div>
                </div>
            </li>
        );
    } 
}
