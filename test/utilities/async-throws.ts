import { assert } from 'chai';

export async function assertThrowsAsync(test, error) {
  try {
    await test();
    assert.fail(undefined, error, 'Function was expected to throw an error but it did not');
  } catch (e) {
    assert.equal(e.message, error);
  }
}

export async function assertDoesNotThrowAsync(test, error) {
  try {
    await test();
  } catch (e) {
    assert.notEqual(e.message, error, 'Function was not expected to throw an error but it did');
  }
}
