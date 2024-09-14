'use strict';

QUnit.module('Проверка работы функции filter', function () {
	QUnit.test('filter экранирует символы в обычном тексте', function (assert) {
		const input = '- "42!", сказала Машина. Это и был главный ответ на Вопрос жизни, вселенной & всего такого...';

		const output = filter(input, [ 'strong', 'em' ]);

		const expected = '- &quot;42!&quot;, сказала Машина. Это и был главный ответ на Вопрос жизни, вселенной &amp; всего такого...';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter не экранирует валидные html-тэги', function (assert) {
		const input = '<strong>Hello, <em>World!</em></strong> 1 + 2 < 4!';

		const output = filter(input, [ 'strong', 'em' ]);

		const expected = '<strong>Hello, <em>World!</em></strong> 1 + 2 &lt; 4!';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter экранирует XSS', function (assert) {
		assert.strictEqual(filter(`<script>alert('1');</script>`, [ 'strong', 'em' ]), '&lt;script&gt;alert(&#39;1&#39;);&lt;/script&gt;');

		assert.strictEqual(filter(`<img src="bad" onerror="alert('1');">`, [ 'strong', 'em' ]), '&lt;img src=&quot;bad&quot; onerror=&quot;alert(&#39;1&#39;);&quot;&gt;');
	});

	QUnit.test('filter обрабатывает пустую строку', function (assert) {
		const input = '';

		const output = filter(input, [ 'strong', 'em' ]);

		const expected = '';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter корректно обрабатывает текст с одинарными кавычками', function (assert) {
		const input = "It's a beautiful day!";

		const output = filter(input, [ 'strong' ]);

		const expected = "It&#39;s a beautiful day!";

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter не обрабатывает текст без тегов', function (assert) {
		const input = 'Простой текст без тегов';

		const output = filter(input, [ 'strong', 'em' ]);

		const expected = 'Простой текст без тегов';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter выбрасывает ошибку, если html не строка', function (assert) {
		assert.throws(() => filter(42, ['strong', 'em']), new TypeError('HTML должен быть строкой'), 'Передано число вместо строки');

		assert.throws(() => filter({}, ['strong', 'em']), new TypeError('HTML должен быть строкой'), 'Передан объект вместо строки');

		assert.throws(() => filter(null, ['strong', 'em']), new TypeError('HTML должен быть строкой'), 'Передано null вместо строки');

		assert.throws(() => filter(undefined, ['strong', 'em']), new TypeError('HTML должен быть строкой'), 'Передано undefined вместо строки');

		assert.throws(() => filter(true, ['strong', 'em']), new TypeError('HTML должен быть строкой'), 'Передано булево значение вместо строки');
	});

	QUnit.test('filter выбрасывает ошибку при некорректных allowedTags', function (assert) {
		assert.throws(() => filter('<b>text</b>', 123), new TypeError('allowedTags должен быть массивом строк'), 'Передано число вместо массива строк');

		assert.throws(() => filter('<b>text</b>', null), new TypeError('allowedTags должен быть массивом строк'), 'Передано null вместо массива строк');

		assert.throws(() => filter('<b>text</b>', {}), new TypeError('allowedTags должен быть массивом строк'), 'Передан объект вместо массива строк');

		assert.throws(() => filter('<b>text</b>', undefined), new TypeError('allowedTags должен быть массивом строк'), 'Передано undefined вместо массива строк');
	});

	QUnit.test('filter корректно обрабатывает вложенные теги', function (assert) {
		const input = '<strong>Hello, <em>world</em>!</strong>';

		const output = filter(input, ['strong', 'em']);

		const expected = '<strong>Hello, <em>world</em>!</strong>';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter экранирует все теги, если allowedTags пуст', function (assert) {
		const input = '<strong>Hello, <em>world</em>!</strong>';

		const output = filter(input, []);

		const expected = '&lt;strong&gt;Hello, &lt;em&gt;world&lt;/em&gt;!&lt;/strong&gt;';

		assert.strictEqual(output, expected);
	});

	QUnit.test('filter корректно обрабатывает строку с тегами, не указанными в allowedTags', function (assert) {
		const input = '<strong>Hello</strong>, <i>world</i>!';

		const output = filter(input, ['strong']);

		const expected = '<strong>Hello</strong>, &lt;i&gt;world&lt;/i&gt;!';
		
		assert.strictEqual(output, expected);
	});

	QUnit.test('filter корректно обрабатывает объект String', function (assert) {
		const input = new String('<div>какой-то html</div>');

		const output = filter(input, ['div']);
		
		const expected = '<div>какой-то html</div>';
	
		assert.strictEqual(output, expected);
	});
});
