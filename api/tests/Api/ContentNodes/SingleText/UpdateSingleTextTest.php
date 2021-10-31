<?php

namespace App\Tests\Api\ContentNodes\SingleText;

use App\Tests\Api\ContentNodes\UpdateContentNodeTestCase;

/**
 * @internal
 */
class UpdateSingleTextTest extends UpdateContentNodeTestCase {
    public function setUp(): void {
        parent::setUp();

        $this->endpoint = 'single_texts';
        $this->defaultContentNode = static::$fixtures['singleText1'];
    }

    public function testPatchText() {
        // when
        $this->patch($this->defaultContentNode, ['text' => 'testText']);

        // then
        $this->assertResponseStatusCodeSame(200);
        $this->assertJsonContains([
            'text' => 'testText',
        ]);
    }

    public function testPatchCleansHTMLFromText() {
        // when
        $this->patch($this->defaultContentNode, ['text' => ' testText<script>alert(1)</script>']);

        // then
        $this->assertResponseStatusCodeSame(200);
        $this->assertJsonContains([
            'text' => ' testText',
        ]);
    }
}
