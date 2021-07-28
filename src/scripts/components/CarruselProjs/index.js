import { h, Component, Fragment } from 'preact'; // NOSONAR
import { VTEX_STOREID_FIELD, SC_MIDDLE_API, MK_ID } from "../../global/constants";

export default class CarruselProjs extends Component {
  token;
  constructor(props) {
    super(props);
    let errorMessage = props.products && props.products.length === 0
      ? 'No hay projectos para el filtro aplicado.'
      : 'Ha ocurrido un error al consultar los projectos.';

    this.state = {
      projects: [],
      ready: false,
      errorMessage
    }
  }

  fetchProjectsData = async () => {
    const consulta = await fetch(`${SC_MIDDLE_API.sellers}?marketplaceId=${MK_ID}`, { method: 'GET' })
    const data = await consulta.json();
    return data;
  };

  componentDidMount = async () => {
    const projects = await this.fetchProjectsData();
    projects && projects.length && this.setState({ projects }, () => {
      $(".carousel-projs")
        .not(".slick-initialized")
        .slick({
          autoplay: true,
          autoplaySpeed: 7000,
          slidesToShow: 4,
          slidesToScroll:4,
          focusOnSelect: true,
          centerMode: true,
          centerPadding: "220px",
          infinite: true,
          responsive: [
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
                arrows: true,
              },
            },
            {
              breakpoint: 1025,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 2,
                arrows: true,
              },
            },
            {
              breakpoint: 769,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                centerMode: true,
                arrows: false,
              },
            },
            {
              breakpoint: 500,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                arrows: true,
              },
            },
          ],
        })
        .on("afterChange", (_, { currentSlide, slideCount }) => {
          currentSlide = currentSlide + 1;

          if (slideCount > 4 && currentSlide < slideCount) {
            $(".carousel-projs ul.slick-dots").animate({
              scrollLeft: (($('.carousel-projs ul.slick-dots li').width() + 20) * (currentSlide - 1))
            }, 100);
          }

        });
    })

    $(".helperComplement").remove();
  }

  render() {
    let { projects } = this.state;
    return projects && (
      <Fragment>
        {projects.map(project => {
          return (
            <div class="logx-box">
              <a href={`./store?fq=${VTEX_STOREID_FIELD}:${project.id}`} class="proj-log">
                <img class="img-responsive" src={project.image} alt="Product Image" />
              </a>
            </div>)
        })}
      </Fragment>
    )
  }
}
