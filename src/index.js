import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  loadMore: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};
refs.loadMore.style.display = 'none';
let page = 1;
let searchText = '';
let previousText = '';
let currentHits = 0;
const lightbox = new SimpleLightbox('.gallery a');

refs.form.addEventListener('submit', handleSearch);
function handleSearch(event) {
  event.preventDefault();
  refs.gallery.innerHTML = '';
  page = 1;
  searchText = event.currentTarget.elements.searchQuery.value;
  getImages(searchText).then(total => {
    if (total > 40) {
      refs.loadMore.style.display = 'block';
    }
  });
}

async function getImages(searchText) {
  const options = {
    params: {
      key: '40083915-617302bde326bce23573f4f7f',
      q: searchText,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  };
  try {
    const response = await axios.get('https://pixabay.com/api/', options);
    if (response.data.total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    const totalHits = response.data.totalHits;
    if (currentHits >= totalHits) {
      Notiflix.Notify.warning(
        `We're sorry, but you've reached the end of search results.`
      );
      refs.loadMore.style.display = 'none';
    }
    currentHits += 40;
    const hits = response.data.hits;
    const cards = hits.map(mapGallery);
    const markup = cards.map(createMarkup).join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
    if (searchText !== previousText) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      previousText = searchText;
    }
    return totalHits;
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function mapGallery({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  };
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
      <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>`;
}

refs.loadMore.addEventListener('click', handleLoadMore);

function handleLoadMore() {
  page += 1;
  getImages(searchText);
}
