import "./carouselStyle.css"
import { loremIpsum } from "lorem-ipsum"

//Custom data type to store carousel configurations
interface CarouselOptions{
  containerSelector: string;
  cardSelector: string;
  animationDuration?: number;
  clonesCount?: number;
}

//Custom data type to create a directional reference variable
type NavigationDirection = 'next' | 'prev';


class InfiniteCarousel{
  private container: HTMLElement;
  private cards: NodeListOf<Element>;
  private totalCards: number;
  private clonesAtStart: number;
  private currentIndex: number = 0;//Logical position of the carousel
  private currentPosition: number;//Physical DOM postiion of carousel
  private cardWidth: number = 300;
  private animationDuration: number;
  private isAnimating: boolean = false;

  constructor(options: CarouselOptions){
    const {containerSelector, cardSelector, animationDuration = 300, clonesCount = 3} = options;

    //Type assertion with null checks
    const container = document.querySelector(containerSelector) as HTMLElement;
    if(!container){
      throw new Error(`Container not found: ${containerSelector}`);
    }

    this.container = container;
    this.cards = container.querySelectorAll(cardSelector);
    this.totalCards = this.cards.length;
    this.clonesAtStart = clonesCount;
    this.currentPosition = this.clonesAtStart;
    this.animationDuration = animationDuration;
  
    this.setupDOM();
    this.calculateCardWidth();
    this.positionCarousel();
    // this.setupEventListeners();
  }

  private setupDOM(): void{
    const originalCards = Array.from(this.cards) as HTMLElement[];

    const firstClones = originalCards.slice(0, this.clonesAtStart).map(card =>{
      const clone = card.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    })

    const lastClones = originalCards.slice(-this.clonesAtStart).map(card =>{
      const clone = card.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    })

    //Build the DOM [last clone][orogonal cards][first clones]
    this.container.replaceChildren();
    lastClones.forEach(clone => this.container.appendChild(clone));
    originalCards.forEach(clone => this.container.appendChild(clone));
    firstClones.forEach(clone => this.container.appendChild(clone));
  }

  private calculateCardWidth(): void{
    const firstCard = this.container.querySelector('.carousel-card') as HTMLElement;
    if(!firstCard){
      throw new Error(`No carousel cards found`);
    }

    const rect = firstCard.getBoundingClientRect();
    const styles = window.getComputedStyle(firstCard);
    const marginRight = parseInt(styles.marginRight) || 0;

    this.cardWidth = rect.width + marginRight;
  }

  private positionCarousel(animate: boolean = true): void{
    const translateX = -this.currentPosition * this.cardWidth;

    this.container.style.transition = animate ? `transform ${this.animationDuration}ms ease` : 'none'

    this.container.style.transform = `translateX(${translateX}px)`;
  }

  public next(): void{
    if(this.isAnimating) return;
    this.navigate('next');
  }

  public prev(): void {
    if(this.isAnimating) return;
    this.navigate('prev')
  }

  private navigate(direction: NavigationDirection): void{
    this.isAnimating = true;

    //update position
    if(direction === 'next'){
      this.currentPosition++;
      this.currentIndex = (this.currentIndex + 1) % this.totalCards;
    } else {
      this.currentPosition--;
      this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards; 
    }

    this.positionCarousel(true)

    //check if reset is needed after the animation
    setTimeout(()=>{
      this.checkAndReset();
      this.isAnimating = false;
    }, this.animationDuration)
  }

  private checkAndReset(): void{
    // const maxPosition = this.totalCards + this.clonesAtStart;
    const maxPosition = this.totalCards;
    // const minPostiion = this.clonesAtStart;
    const minPostiion = 1;

    if(this.currentPosition > maxPosition) {
      //reset to the beginning
      this.currentPosition = minPostiion;
      this.positionCarousel(false);
    }else if(this.currentPosition < minPostiion) {
      //Reset to the end
      this.currentPosition = maxPosition;
      this.positionCarousel(false);
    }
  }

  //getters
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalCards(): number{
    return this.totalCards;
  }
}

function generateCard(imageURL: string): HTMLElement {
  let div = document.createElement('div');
  let img = document.createElement('img');
  let textContainer = document.createElement('div');
  let textHeader = document.createElement('h3');
  let description = document.createElement('p');

  div.className = "carousel-card";
  img.className = "carousel-image";
  img.src = imageURL;

  textContainer.className = "text-Container";
  textHeader.className = "text-Header";
  description.className = "text-Content";

  textHeader.textContent = "Header Title";
  description.textContent = `${loremIpsum({count: 20, format: "plain", units: "words"})}`
  textContainer.appendChild(textHeader);
  textContainer.appendChild(description);

  div.appendChild(textContainer);
  div.appendChild(img);
  return div;
}

function buildCarouselElements(): void{
  let mainContainer = document.querySelector('.carousel-container') as Element;

  const imageCarousel = document.createElement('div');//create the carousel element
  imageCarousel.className = "image-carousel";

  const modules = import.meta.glob("/src/carousel_Images/*.jpg", {eager: true})//import all images for the cards into a variable
  const images: string[] = Object.values(modules).map((mod:any)=>mod.default);//Map each image URL onto an array

  //Using the mapped images build and append each carousel card
  images.forEach((image)=>{
    imageCarousel.appendChild(generateCard(image));
  })

  mainContainer.appendChild(imageCarousel);
}

function setupCarousel(): void{
  buildCarouselElements();

  const carousel = new InfiniteCarousel({
    containerSelector: '.image-carousel',
    cardSelector: '.carousel-card',
    animationDuration: 300,
    clonesCount: 3
  });

  //create navigation buttons
  const createButton = (className: string, text: string, onClick: ()=> void): HTMLButtonElement =>{
    const button = document.createElement('button');
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  const backButton = createButton('nav-btn back', '<', () => carousel.prev());
  const forwardsButton = createButton('nav-btn forwards', '>', () => carousel.next());

  const carouselContainer = document.querySelector('.carousel-container') as HTMLElement;
  if(carouselContainer){
    carouselContainer.appendChild(backButton);
    carouselContainer.appendChild(forwardsButton);
  }
}

document.addEventListener('DOMContentLoaded', setupCarousel)
