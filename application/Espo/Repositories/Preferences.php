<?php

namespace Espo\Repositories;

use Espo\ORM\Entity;

class Preferences extends \Espo\Core\ORM\Repository
{
	protected $dependencies = array(
		'fileManager'
	);
	
	protected $data = array();
	
	protected $entityName = 'Preferences';
	
	protected function getFileManager()
	{
		return $this->getInjection('fileManager');
	}
	
	protected function getFilePath($id)
	{
		return 'data/preferences/' . $id . '.php';
	}
	
	public function get($id = null)
	{				
		if ($id) {
			$entity = $this->entityFactory->create('Preferences');
			$entity->id = $id;
			if (empty($this->data[$id])) {
				$fileName = $this->getFilePath($id);
				if (file_exists($fileName)) {
					$this->data[$id] = $this->getFileManager()->getContent($fileName);
				} else {
					$fields = $this->getMetadata()->get('entityDefs.Preferences.fields');
					$defaults = array();
					foreach ($fields as $field => $d) {
						if (array_key_exists('default', $d)) {
							$defaults[$field] = $d['default'];
						}
					}
					$this->data[$id] = $defaults;
				}			
			}
			$entity->set($this->data[$id]);
			return $entity;
		}		
	}
	
	public function save(Entity $entity)
	{
		if ($entity->id) {
			$this->data[$entity->id] = $entity->toArray();
			
			$fileName = $this->getFilePath($entity->id);
			$this->getFileManager()->setContentPHP($this->data[$entity->id], $fileName);
			return $entity;
		}
	}
		
	public function remove(Entity $entity)
	{
		$fileName = $this->getFilePath($id);
		unlink($fileName);
		if (!file_exists($fileName)) {
			return true;
		}
	}

	public function find(array $params)
	{
	}
	
	public function findOne(array $params)
	{
	}

	public function getAll()
	{
	}
	
	public function count(array $params)
	{
	}
}
