import { Game } from './game';
import { initControllers } from './controllers';


window.onload = () => {
    const game = new Game('game');

    initControllers(game);
    game.run(0);
}
