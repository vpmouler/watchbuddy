import axios from 'axios';
import MovieGridListButtons from './MovieGridListButtons';
import MovieInfo from './MovieInfo';
import React, { Component } from 'react';

import {
  Content
} from 'native-base';

import {
  Image,
  TouchableHighlight,
  View,
  Linking
} from 'react-native';

import {
  Col,
  Grid,
  Row
} from 'react-native-easy-grid';

import {
  Button
} from 'react-native-elements';

export default class MovieGridList extends Component<{}> {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 0,
      selectedMovie: this.props.data.length ? null : this.props.data,
      movieUrl: 'https://www.amazon.com/Object-Beauty-John-Malkovic…camp=2025&creative=165953&creativeASIN=B003DZAZFE' // should be null in the beginning or () => alert(we're working on this feature)
    };
  }

  onLeftButtonPress() {
    console.log('left button clicked');
    this.setState({currentIndex: Math.abs(this.state.currentIndex - 4) % this.props.data.length});
  }

  onRightButtonPress() {
    console.log('right button clicked');
    this.setState({currentIndex: (this.state.currentIndex + 4) % this.props.data.length});
  }

  // componentWillMount() {
  //   if (this.props.clickedFavorites) {
  //     this.state.selectedMovie = this.props.data
  //   } else {
  //     console.log('You got here W/O clicking Favs (need to fix AMAZON link and make dynamic)')
  //   }
  // }

  onPosterPress(movie) {
    console.log('MOVIE', movie);

    axios.post('http://13.57.94.147:8080/selectMovie', {movie: movie.title})
      .then(data => {
        console.log('response from AMAZON API', data)
        this.setState({
          selectedMovie: movie,
          movieUrl:data.data.movieUrl
        })
      }) // data.data.movieUrl 
      .catch(err => {
        this.setState({
          selectedMovie: movie,
          movieUrl: null
        })
        console.log('err from amazon: ', err)
      })
  }

  getMoviePoster(movie) {
    return (
      movie ?
        <TouchableHighlight onPress={() => this.onPosterPress.call(this,movie)}>
          <Image
            source={{ height: this.props.dimensions.height / 2, width: this.props.dimensions.width / 2, uri: `https://image.tmdb.org/t/p/w500/${movie.poster_path}` }}
          />
        </TouchableHighlight>
        : null
    );    
  }

  componentWillUpdate() {
    if (this.state.selectedMovie) {
      this.setState({ selectedMovie: null });
    }
  }

  render() {
    console.log('movie URL: ', this.state.movieUrl)
    console.log('this.props.data',this.props.data)
    return (
      (!this.state.selectedMovie) ?
        <Content>
          <Grid>
            <Col style={{ height: this.props.dimensions.height }}>
              <Row>
                {this.getMoviePoster(this.props.data[this.state.currentIndex % this.props.data.length])}
              </Row>
              <Row>
                {this.getMoviePoster(this.props.data[(this.state.currentIndex + 1) % this.props.data.length])}
              </Row>
            </Col>
            <Col style={{ height: this.props.dimensions.height }}>
              <Row>
                {this.getMoviePoster(this.props.data[(this.state.currentIndex + 2) % this.props.data.length])}
              </Row>
              <Row>
                {this.getMoviePoster(this.props.data[(this.state.currentIndex + 3) % this.props.data.length])}
              </Row>
            </Col>
          </Grid>
          <MovieGridListButtons 
            style={{ height: this.props.dimensions.height, width: this.props.dimensions.width }} 
            handleLeftButtonPress={this.onLeftButtonPress.bind(this)} 
            handleRightButtonPress={this.onRightButtonPress.bind(this)}
          />
        </Content>
      :
        <Content>
          <MovieInfo fbToken={this.props.fbToken} movieUrl={this.state.movieUrl} dimensions={this.props.dimensions} movie={this.state.selectedMovie} />
        </Content>
    );
  }
}