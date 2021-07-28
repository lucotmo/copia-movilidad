import { h, Component } from 'preact'; // NOSONAR
import { Carousel } from 'react-responsive-carousel';
export default class VitrineImages extends Component {

    constructor(props) {
        super(props);
        this.state = {
            images: this.props.images,
            id: this.props.id
        };
    }

    render() {
        let { images } = this.state;
        return (
            <Carousel
                showStatus={false}
                showThumbs={false}
                showIndicators={true}
                showArrows={false}
                infiniteLoop={false}
            >
                {images.map((image, index) => {
                    return (
                        <img class="img-responsive carousel-img-shelf" src={image.imageUrl} alt="Product Image" />
                    );
                })}
            </Carousel> 
        );
    }
}

$( window ).resize(function() {
    setTimeout(function(){
        const sectionSelector = $('.shelf-wrapper .slick-track').first();
        const shelfs = sectionSelector.find('.bc-shelf-item');
        const widthItem = sectionSelector.find('.bc-shelf-item__top').width();
        
        if(widthItem > 1000){
            setTimeout(function(){
                shelfs.each(function(){
                    const parent = $(this).find('.bc-shelf-item__img').parent();
                    parent.width(widthItem * $(this).find('.bc-shelf-item__img').length);
                    $(this).find('.bc-shelf-item__img').width(widthItem);
                    
                });
                
            }, 400)
        }else{
            
            shelfs.each(function(){
                const parent = $(this).find('.bc-shelf-item__img').parent();
                parent.width(widthItem * $(this).find('.bc-shelf-item__img').length);
                $(this).find('.bc-shelf-item__img').width(widthItem);
                
            });
        }
        
    }, 600);
  });