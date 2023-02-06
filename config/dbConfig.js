module.exports = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '#nayRP0019',
    DB: 'CSYEWebapp',
    dialect: 'mysql',

    pool: {
        max: 5,//the maximum number of connections in the pool
        min: 0,//the minimum number of connections in the pool
        acquire: 30000,//the maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000//the maximum time, in milliseconds, that a connection can be idle before being released
    }
}