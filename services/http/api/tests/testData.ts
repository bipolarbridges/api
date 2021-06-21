import { allModels, resource } from '../lib/models';
import { Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import FixtureLoader from '../lib/fixtures/FixtureLoader';
dotenv.config();

type resource = {
    path: string,
    method: string
}

const paths: resource[]= [{ path: '/client', method: 'POST' }, {path: '/measurement', method: 'POST'}];

new FixtureLoader().load(async (session: Session, models: allModels) => {
	await models.identity.createOne({
		type: "key",
		name: "test_export_key",
		check: "d4f79b313f8106f5af108ad96ff516222dbfd5a0ab52f4308e4b1ad1d740de60",
		Resource: {
		propertiesMergeConfig: {
			nodes: true,
			relationship: true,
		},
		properties: paths,
		}
	}, { session });
	const id = 'client0@email.com';
	await models.user.createOne(
	{
		uid: id,
		Resource: {
		propertiesMergeConfig: {
			nodes: true,
			relationship: true,
		},
		properties: [
			{
			path: `/client/${id}`,
			method: 'GET'
			},
		],
		},
	}, { merge: true, session });
})
.then(() => {
	process.exit(0);
})
.catch((err) => {
	console.log(err);
	process.exit(1);
});