import { o } from './dom/element';
import Router from './dom/router';
import { State } from './state/state';
import './style.scss';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
  <hr />
`;

const router = new Router({ mode: 'history', root: '/' });
router.add('/', () => {
  const redDot = o({ el: 'div', classes: 'red' });
  app.appendChild(redDot);
  app.querySelector('h1')!.textContent = 'Home Page!';
  return () => {
    app.removeChild(redDot);
  };
});
router.add('/about', () => {
  app.querySelector('h1')!.textContent = 'About Page!';
});
router.add('/game', () => {
  app.querySelector('h1')!.textContent = 'Game Page!';
});
router.listen();

app.appendChild(
  o({
    el: 'button',
    text: 'Home',
    events: {
      click() {
        router.navigate('/');
      },
    },
  }),
);
app.appendChild(
  o({
    el: 'button',
    text: 'About',
    events: {
      click() {
        router.navigate('/about');
      },
    },
  }),
);
app.appendChild(
  o({
    el: 'button',
    text: 'Game',
    events: {
      click() {
        router.navigate('/game');
      },
    },
  }),
);

const state = new State({
  user: 'Kaffe',
  account: {
    points: 0,
  },
  contacts: {
    friends: ['Blu'],
    blocked: ['Jane'],
  },
});

state.addAction('addPoint', (draft, amount: number) => (draft.account.points += amount));
state.addAction('addFriend', (draft, friend: string) => draft.contacts.friends.push(friend));
state.addObserver('account.points', (newPoints) => console.log('newPoints:', newPoints));
state.addObserver('contacts.friends', (newFriends) => console.log('newFriends:', newFriends));

app.appendChild(
  o({
    el: 'button',
    text: 'Change State!',
    events: {
      click() {
        // state.dispatch('addPoint', 1);
        // console.log(state.state);
        state.dispatch('addFriend', 'Node');
      },
    },
  }),
);
