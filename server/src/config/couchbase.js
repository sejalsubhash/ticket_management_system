const { Couchbase } = require('couchbase');

const clusterOptions = {
  username: process.env.COUCHBASE_USERNAME || 'admin',
  password: process.env.COUCHBASE_PASSWORD || 'Admin@123',
};

const connString = process.env.COUCHBASE_CONN_STRING || 'couchbases://cb.fig9ra1k4bwds7df.cloud.couchbase.com';
const bucketName = process.env.COUCHBASE_BUCKET || 'travel-sample';

let cluster;
let bucket;

async function getCluster() {
  if (!cluster) {
    cluster = await Couchbase.connect(connString, clusterOptions);
    bucket = cluster.bucket(bucketName);
  }
  return { cluster, bucket };
}

async function getCollection(scopeName = '_default', collectionName) {
  const { bucket } = await getCluster();
  const scope = bucket.scope(scopeName);
  return scope.collection(collectionName);
}

module.exports = { getCluster, getCollection };
