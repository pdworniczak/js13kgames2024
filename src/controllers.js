import { SCALE } from "./consts";
import { OBJECT_STATE, OBJECT_TYPE } from "./units/index.js";
import { AttackOrder, MoveOrder } from "./orders";
import { Point } from "./utils.js";

export const initControllers = (game) => {
    document.addEventListener('keydown', e => {
        const { currentFrame} = game;
    
        if (e.key === 'q') {
            window.cancelAnimationFrame(currentFrame);
            document.getElementById('frameRate').innerHTML = '-';
        }
    });

    document.addEventListener('mousedown', e => {
        const gameRect = game.container.getBoundingClientRect();
        const relX = e.clientX - gameRect.x; //mouse x relative to game container
        const relY = e.clientY - gameRect.y; //mouse y relative to game container

        const clickPosition = new Point(relX <= 800 && relX >= 0 ? relX : -1, relY <= 600 && relY >= 0 ? relY: -1);

        if (clickPosition.isValid()) {
            if (e.buttons === 1) {
                selectEvent(clickPosition);
            }
    
            if (e.buttons === 2) {
                actionEvent(clickPosition);
            }
        }
    })

    const selectEvent = (clickPosition) => {   
        const selectedGameObject = game
            .units
            .filter((gameObject) => gameObject.TYPE === OBJECT_TYPE.UNIT)
            .map((gameObject) => { gameObject.state = OBJECT_STATE.NONE; return gameObject })
            .find((gameObject) => {
                const distansToObjectCenter = Math.sqrt(Math.pow(gameObject.position.x - clickPosition.x, 2) + Math.pow(gameObject.position.y - clickPosition.y, 2));
                const isObjectClicked = SCALE * gameObject.SIZE >= distansToObjectCenter;
                if (isObjectClicked) {
                    gameObject.state = OBJECT_STATE.SELECTED;
                }

                return isObjectClicked;
            })
    }

    const actionEvent = (clickPosition) => {
        const selectedUnits = getSelectedUnits();

        const unitClicked = game.units.find(unit => Math.abs(unit.position.x - clickPosition.x) <= unit.size && Math.abs(unit.position.y - clickPosition.y) <= unit.size);

        for (const unit of selectedUnits) {
            if (unitClicked) {
                if (unit.team.isHostile(unitClicked.team)) {
                    console.log('ATTACK!!!');
                    unit.orders[0] = new AttackOrder(unitClicked);
                }
            } else {
                unit.orders[0] = new MoveOrder(clickPosition);
            }
        }
    }

    const getSelectedUnits = () => {
        return game.units.filter(gameObject => gameObject.state === OBJECT_STATE.SELECTED);
    }
}