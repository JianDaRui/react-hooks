import { useState } from 'react';

export default function Form() {
  const [book, setBook] = useState({
    bookName: 'Javascript 高级程序设计',
    otherInfo: {
      author: '马特·弗里斯比',
      version: '第 4 版',
    }
  });

  function handleNameChange(e) {
    setBook({
      ...book,
      bookName: e.target.value
    });
  }

  function handleAuthorChange(e) {
    setBook({
      ...person,
      artwork: {
        ...person.artwork,
        title: e.target.value
      }
    });
  }

  function handleVersionChange(e) {
    setBook({
      ...book,
      otherInfo: {
        ...book.otherInfo,
        version: e.target.value
      }
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          value={book.name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Author:
        <input
          value={book.otherInfo.author}
          onChange={handleAuthorChange}
        />
      </label>
      <label>
        Version:
        <input
          value={book.otherInfo.version}
          onChange={handleVersionChange}
        />
      </label>
      <p>
        <i>{book.bookName}</i>
        {' by '}
        {book.otherInfo.author}
        <br />
        (Version:{book.otherInfo.version})
      </p>
    </>
  );
}

