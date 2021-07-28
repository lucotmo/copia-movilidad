import { h, Component, Fragment } from "preact"; // NOSONAR
import shelfFunctions from "../../../base/shelf";
import { UserServices } from "../../../global/user";
import VitrineItem from "../../Vitrine/VitrineItem";

export default class VitrineItemsRecoments extends Component {
  constructor(props) {
    super(props);
    const user = UserServices.getUserData();
    this.state = {
      products: this.props.products || [],
      isUserDefined: user && user.isUserDefined
    };
  }

  componentDidMount() {
    if (this.state.products) {
      shelfFunctions.init({ slickShelf: true });
      $(".bc-modal__wrapper.fullpage-loader").hide();
    } else $(".bc-modal__wrapper.fullpage-loader").hide();
  }

  componentDidUpdate() {
    if (this.state.products) shelfFunctions.init({ slickShelf: true });
  }
  render() {
    let { isUserDefined } = this.state;
    let { products } = this.props;
    return (
      <Fragment>
        <div class="bc-shelf-container container">
          <h4 class="bc-shelf-container__title m-bottom-2 hidden-lg">
            {isUserDefined ? "Te recomendamos estos carros" : "Otras personas están visitando"}
            <span class="bc-shelf-container__counter"></span>
          </h4>
          <div class="bc-shelf-container__wrap row">
            <div class="bc-shelf-container__outer visible-lg">
              <div class="bc-shelf-container__title visible-lg">
                <h4>{isUserDefined ? "Te recomendamos estos carros" : "Otras personas están visitando"}</h4>
                {!!isUserDefined && (
                  <a href="./recomendados" class="bc-btn-primary financiacion">IR A RECOMENDADOS</a>
                )}
              </div>
            </div>
            <div className="bc-shelf-container__items">
              <h2>slider</h2>
              <ul>
                {!!products && products.length > 0 ? products.map((product) => {
                  return <VitrineItem product={product} isvitrine={true} />;
                }) : (
                    <div class="ml15 full-width text-center">{errorMessage}</div>
                  )}
              </ul>
              {!!isUserDefined && (
                <div class="recommendedFinanciacion ">
                  <a href="./recomendados" class="bc-btn-primary financiacion ">IR A RECOMENDADOS</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
