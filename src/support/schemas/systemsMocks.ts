import generateNewMongoID from 'src/support/helpers/generateNewMongoID';
import { ISystem } from 'src/schemas/systemsValidationSchema';
import IMock from 'src/types/IMock';

const systemInstance: ISystem = {
  _id: generateNewMongoID(),
  name: 'Tormenta',
  content: {
    races: [generateNewMongoID()],
    classes: [generateNewMongoID()],
    spells: [generateNewMongoID()],
    items: [generateNewMongoID()],
    weapons: [generateNewMongoID()],
    armors: [generateNewMongoID()],
    feats: [generateNewMongoID()],
    realms: [generateNewMongoID()],
    gods: [generateNewMongoID()],
    monsters: [generateNewMongoID()]
  },
  references: {
    srd: 'http://tormenta20.com.br',
    icon: 'http://tormenta20.com.br/icon/550.jpg',
    cover: 'http://tormenta20.com.br/cover/2100.jpg'
  },
  active: true
};

const system: IMock = {
  instance: systemInstance,
  description: 'Mock an instance of a RPG system'
};

export default system;
