const { Cluster } = require('couchbase');

const clusterOptions = {
  username: process.env.COUCHBASE_USERNAME || 'admin',
  password: process.env.COUCHBASE_PASSWORD || 'Admin@123',
  timeouts: {
    connectTimeout: 10000,
    kvTimeout: 10000,
    queryTimeout: 10000,
  },
};

const connString = process.env.COUCHBASE_CONN_STRING || 'couchbases://cb.fig9ra1k4bwds7df.cloud.couchbase.com';
const bucketName = process.env.COUCHBASE_BUCKET || 'travel-sample';

let cluster;
let bucketInstance;

async function getCluster() {
  if (!cluster) {
    try {
      cluster = await Cluster.connect(connString, clusterOptions);
      bucketInstance = cluster.bucket(bucketName);
      await bucketInstance.waitUntilReady({ timeout: 10000 });
    } catch (err) {
      cluster = null;
      bucketInstance = null;
      throw new Error(`Couchbase connection failed: ${err.message}. Make sure your IP is whitelisted in Couchbase Cloud.`);
    }
  }
  return { cluster, bucket: bucketInstance };
}

async function getDefaultCollection() {
  const { bucket: b } = await getCluster();
  return b.defaultCollection();
}

module.exports = { getCluster, getDefaultCollection };
