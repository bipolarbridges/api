import { allModels } from '../models';
import { error } from '../logging';
import { Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import { makeMeasurementProperties, mergedMeasurement } from '../interface';
import FixtureLoader from './FixtureLoader';
dotenv.config();

function createMergeProperties(name: string, source: string) {
    return {
        propertiesMergeConfig: {
            nodes: true,
            relationship: true,
        },
        properties: [
            {
                name,
                Source: {
                    propertiesMergeConfig: {
                        nodes: true,
                        relationship: true,
                    },
                    properties: [
                        {
                            name: source,
                        }
                    ]
                }
            }
        ]
    };
}

const users = ['1', '2']
type measurementList = {
    [key: string] : mergedMeasurement[]
};

const measurements: measurementList = {
    [`${users[0]}`]: [
        makeMeasurementProperties(90, 8, 13, 9, 2021, 1890237291, undefined, createMergeProperties('heartrate', 'measurement')),
        makeMeasurementProperties(0.8, 3, 1, 9, 2021, 18966712291, undefined, createMergeProperties('sentiment', 'measurement')),
    ],
    [`${users[1]}`]: [
        makeMeasurementProperties(6, 12, 27, 3, 2021, 189667111111, undefined, createMergeProperties('sentiment', 'measurement')),
    ],
};

new FixtureLoader().load( async (session: Session, models: allModels) => { 
        const createdList = users.map(uid => {
            return {
                uid,
                Measurement: {
                    propertiesMergeConfig: {
                        nodes: true,
                        relationship: true,
                    },
                    properties: measurements[uid]
                },
                Resource: {
                    propertiesMergeConfig: {
                        nodes: true,
                        relationship: true,
                    },
                    properties: [
                        {
                            path: `/client/${uid}`,
                            method: 'GET'
                        },
                    ],
                },    
            }
        });

        await models.user.createMany(createdList, { session, merge: true });
    })
.then(() => {
	process.exit(0);
})
.catch((err) => {
	error(err);
	process.exit(1);
});