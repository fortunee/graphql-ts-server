import fetch from 'node-fetch';

test('Ensures invalid confirmation link fails', async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/1234`);
  const text = await response.text();
  expect(text).toEqual('Invalid confrimation link');
});
