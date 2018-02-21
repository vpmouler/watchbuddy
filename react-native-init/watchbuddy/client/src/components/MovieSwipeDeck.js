import googleApiRequests from '../utils/googleApiRequests';
import MovieSwipeDeckButtons from './MovieSwipeDeckButtons';
import movieSwipeDeckStyles from '../styles/movieSwipeDeck';
import React from 'react';
import _ from 'underscore';
import BrainPNG from '../../assets/thinking256.png';

import {
  Animated,
  Button,
  Dimensions,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text
} from 'react-native';

import {
  Card,
  CardItem,
  DeckSwiper,
  View
} from 'native-base';

import SwipeDeckData from '../data/dummyRequestData'; // may delete if can use static imgs

const COMPONENT_WIDTH_RATIOS = {
  cardWidth: .92
}

const COMPONENT_HEIGHT_RATIOS = {
  movieSwipeDeck: .85,
  movieSwipeDeckButtons: .15
}

// Preload Images
const posterList = [
  require('../data/static_poster_images/bladeRunner.jpg'),
  require('../data/static_poster_images/it.jpg'),
  require('../data/static_poster_images/titanic.jpg'),
  require('../data/static_poster_images/inception.jpg'),
  require('../data/static_poster_images/starWars.jpg'),
  require('../data/static_poster_images/batmanDarkKnight.jpg')
];

export default class MovieSwipeDeck extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: SwipeDeckData.data,
      changeView: this.props.changeView,
      dimensions: this.props.dimensions,
      liked: [],
      disliked: [],
      unwatched: [],
      modalVisible: this.props.fbToken ? false : true,
    };

    // Animations
    this.springValue = new Animated.Value(0.1)
    this.spring = () => {
      Animated.spring(
        this.springValue,
        {
          toValue: .5,
          friction: 0,
          tension: 0,
        }
      ).start();
    }

    // Number Empty Calls (triggers once on last card, then again on renderEmpty)
    this.numRenderEmptyCalls = 0;

    // Styles
    this.styles = movieSwipeDeckStyles.getStyles(this.props.dimensions);

    // Bindings
    this.renderCard = this.renderCard.bind(this);
    this.renderEmpty = this.renderEmpty.bind(this);
    this.onSwipeRight = this.onSwipeRight.bind(this);
    this.onSwipeLeft = this.onSwipeLeft.bind(this);
    this.onUnwatched = this.onUnwatched.bind(this);
    this.triggerSwipeRight = this.triggerSwipeRight.bind(this);
    this.triggerSwipeLeft = this.triggerSwipeLeft.bind(this);
    this.triggerUnwatched = this.triggerUnwatched.bind(this);
    this.throttleButtonPresses = this.throttleButtonPresses.bind(this)();

    // Card posters
    this.posterCardNum = 0;
  }

  componentWillMount() {
    this.state.data.forEach((movie, index) => {
      movie.posterUrl = posterList[index];
    });
  }

  closeModal() {
    this.setState({modalVisible:false});
  }

  onSwipeRight(card) {
    this.posterCardNum++;
    console.log("Movie liked: " + card.title);
    this.state.liked.push(card); // do we need both of this line and below, Tim?
    this.setState({ liked: this.state.liked });
  }

  onSwipeLeft(card) {
    this.posterCardNum++;
    console.log("Movie disliked: " + card.title);
    this.state.disliked.push(card);
    this.setState({ disliked: this.state.disliked });
  }

  onUnwatched(card) {
    this.posterCardNum++;
    console.log("Movie unwatched: " + card.title);
    this.state.unwatched.push(card);
    this.setState({ unwatched: this.state.unwatched });
  }

  triggerSwipeRight() {
    let card = this._deckSwiper._root.state.selectedItem;
    this._deckSwiper._root.swipeRight();
    this.onSwipeRight(card);
  }

  triggerSwipeLeft() {
    let card = this._deckSwiper._root.state.selectedItem;
    this._deckSwiper._root.swipeLeft();
    this.onSwipeLeft(card);
  }

  triggerUnwatched() {
    let card = this._deckSwiper._root.state.selectedItem;
    this._deckSwiper._root.swipeLeft();
    this.onUnwatched(card);
  }

  renderCard(card) {
    return (
      <Card style={this.styles.Card}>
        <CardItem cardBody>
          <Image 
            style={this.styles.Image}
            source={card.posterUrl}
          />
        </CardItem>
      </Card>
    )
  }

  isEmptySwipeDeck() {
    return this.state.liked.length + this.state.disliked.length + this.state.unwatched.length === this.state.data.length;
  }

  prefetchImages(movies) {
    for (let i = 0; i < movies.length; i += 1) {
      const movie = movies[i];
      Image.prefetch(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
    }
  }

  renderEmpty() {
    const {
      data,
      changeView,
      dimensions
    } = this.state;

    if (this.numRenderEmptyCalls === 1) {
      googleApiRequests.queryGoogleApi(this.state.liked, this.props.fbToken)
      .then(data => {
        data = JSON.parse(data.data).results;
        console.log(data);
        this.prefetchImages(data);
        setTimeout(() => changeView('MovieGridList', data), 3000); // changed from 2k bc was loading without poster pics, possibly bc of China internet
      })
      .catch(err => {
        console.log(err);
        alert('There was an error! Please restart the app.');
        changeView('MovieGridList'); // Do we want this?
      });
    }

    this.numRenderEmptyCalls += 1;

    this.spring();

    return (
    <View style={{flexDirection: "column", height: dimensions.height, justifyContent: 'center', alignItems: 'center'}}>
      <Animated.Image
        style={{
          transform: [{scale: this.springValue}],
          alignItems: 'center',
          justifyContent:'center',
       }}
        source={BrainPNG}/>
      <Text style={this.styles.Text}>
        Our AI is building your recommendations...
      </Text>
    </View>
    )
  }

  throttleButtonPresses() {
    return _.throttle((event) => event(), 650);
  }

  render() {
    const {
      data,
      dimensions,
    } = this.state;

    return (
      <View 
        style={{
          height: dimensions.height, 
          flexDirection: 'column'
        }}>
        <View 
          style={{ height: dimensions.height * COMPONENT_HEIGHT_RATIOS.movieSwipeDeck }}> 
            <Modal
              visible={this.state.modalVisible}
              animationType={'slide'}
              onRequestClose={() => this.closeModal()}
              presentationStyle={'formSheet'}
            >
            <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'rgba(99,149,222,0.95)'}}>
              <View style={{alignItems: 'center', paddingLeft: 10, paddingRight: 10}}>
                <Text style={{color: "rgba(255,255,255,1)", paddingBottom: 20}}>
                  Welcome to WatchBuddy!
                  {"\n"}{"\n"}
                  - Swipe right on movies you like.{"\n"}
                  - Swipe left on those you don't like.{"\n"}
                  - If you haven't seen the movie - press the yellow button in the center.{"\n"}
                  {"\n"}{"\n"}
                  As you use WatchBuddy and save movies, our A.I. will continue building and improving recommendations for you.
                  {"\n"}{"\n"}
                  - WatchBuddy Team
                </Text>
                <Button
                    onPress={() => this.closeModal()}
                    title="Okay, let's go!"
                >
                </Button>
              </View>
            </View>
          </Modal>
          <DeckSwiper
            ref={(c) => this._deckSwiper = c}
            dataSource={data} // what's this used for, Tim?
            renderItem={this.renderCard}
            renderEmpty={this.renderEmpty}
            onSwipeRight={this.onSwipeRight}
            onSwipeLeft={this.onSwipeLeft}
            looping={false}
          />
        </View>
        {
          (!this.isEmptySwipeDeck()) ?
            <MovieSwipeDeckButtons
              dimensions={{ height: dimensions.height * COMPONENT_HEIGHT_RATIOS.movieSwipeDeckButtons, width: dimensions.width * COMPONENT_WIDTH_RATIOS.cardWidth }}
              handleRightButtonPress={() => this.throttleButtonPresses(this.triggerSwipeRight)}
              handleUnwatchedButtonPress={() => this.throttleButtonPresses(this.triggerUnwatched)}
              handleLeftButtonPress={() => this.throttleButtonPresses(this.triggerSwipeLeft)}
            />
          : null
        }
      </View>
    );
  }
}