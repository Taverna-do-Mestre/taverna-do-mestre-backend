import request from 'supertest';
import app from 'src/app';
import { connect, close } from '../../connectDatabaseTest';
import SystemsModel from 'src/database/models/SystemsModel';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import mocks from 'src/support/mocks';
import { IUpdateContent } from 'src/schemas/updateContentSchema';
import { ISystem } from 'src/schemas/systemsValidationSchema';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';

describe('Patch RPG systems in database', () => {
  beforeAll(() => {
    connect();
  });

  afterAll(async () => {
    await close();
  });

  const model = new SystemsModel();
  const contentPayload = mocks.updateSystemContent.instance as IUpdateContent;
  // const { method: _, ...newSystemContentPayloadWrong } = contentPayload;

  const systemMockInstance = mocks.system.instance as ISystem;
  const { _id: __, ...systemMockPayload } = systemMockInstance;

  let documentId: string;

  describe('When update the content of the rpg system', () => {
    it('should return successfull confirmation', async () => {
      const response = await model.create(systemMockPayload);
      documentId = response._id as string;

      const { text } = await request(app)
        .patch(`/systems/${documentId}?entity=races`)
        .send(contentPayload)
        .expect(HttpStatusCode.OK);

      expect(text).toBe(`New ID ${contentPayload.newID} was ${contentPayload.method} to array of entities races`);
    });

    it('should fail when data is wrong', async () => {
      const { body } = await request(app)
        .patch(`/systems/${documentId}?entity=races`)
        .send({ data: null })
        .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('name');
      expect(JSON.parse(body.message)[0].path[0]).toBe('method');
      expect(JSON.parse(body.message)[0].message).toBe('Required');
      expect(body.name).toBe('ValidationError');
    });

    it('should fail when no entityData', async () => {
      const { body } = await request(app)
        .patch(`/systems/${documentId}`)
        .send(contentPayload)
        .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('name');
      expect(body.message).toBe('An entity name is required');
      expect(body.name).toBe('ValidationError');
    });

    it('should fail with inexistent ID', async () => {
      const { body } = await request(app)
        .patch(`/systems/${generateNewMongoID()}?entity=races`)
        .send(contentPayload)
        .expect(HttpStatusCode.NOT_FOUND);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('name');
      expect(body.message).toBe('Not found a system with provided ID');
      expect(body.name).toBe('NotFound');
    });
  });
});
