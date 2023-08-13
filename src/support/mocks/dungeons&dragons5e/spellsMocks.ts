import { Spell } from 'src/schemas/dungeons&dragons5e/spellsValidationSchema';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';
import Connections from 'src/database/DatabaseConnection';
import Mock from 'src/types/Mock';

const spellMockEn: Spell = {
    name: 'Fire ball',
    description: 'Explodes everyone',
    type: 'Fire',
    level: 1,
    higherLevels: [
        {
            level: '2',
            damage: [
                {
                    type: 'magico',
                    dice: '4d6',
                },
            ],
            buffs: ['Strength'],
            debuffs: ['Fire'],
        },
    ],
    damage: [
        {
            type: 'magical',
            dice: '4d6',
        },
    ],
    castingTime: '1',
    duration: '5',
    range: '25',
    components: 'Fire',
    buffs: ['Strength'],
    debuffs: ['Fire'],
};

const spellMockPt: Spell = {
    name: 'Bola de fogo',
    description: 'Explode todo mundo',
    type: 'Fogo',
    level: 1,
    higherLevels: [
        {
            level: '2',
            damage: [
                {
                    type: 'magico',
                    dice: '4d6',
                },
            ],
            buffs: ['Força'],
            debuffs: ['Fogo'],
        },
    ],
    damage: [
        {
            type: 'magico',
            dice: '4d6',
        },
    ],
    castingTime: '1',
    duration: '5',
    range: '25',
    components: 'Fogo',
    buffs: ['Força'],
    debuffs: ['Fogo'],
};

const spell: Mock = {
    instance: {
        _id: generateNewMongoID(),
        active: true,
        en: spellMockEn,
        pt: spellMockPt,
    },
    description: 'Mock an instance of a RPG spell',
};

export default spell;