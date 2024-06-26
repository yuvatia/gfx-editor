import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ComponentView } from './ComponentView';
import { NiceButton } from './SceneView';
import { DirectionalLight, Material, MeshFilter, MeshRenderer, Tag } from './engine/src/components';
import { FollowConstraint, Rigidbody } from './engine/src/kinematics';
import { Transform } from './engine/src/transform';

export const ComponentSpecification = {
  Tag: {
    type: Tag,
    fields: ["name"]
  },
  Transform: {
    type: Transform,
    fields: ["position", "rotation", "scale"]
  },
  MeshRenderer: {
    type: MeshRenderer,
    // TODO missing wireframe
    fields: ["shading", "outline", "writeIdToStencil"]
  },
  Material: {
    type: Material,
    fields: ["diffuse", "faceColoring"]
  },
  DirectionalLight: {
    type: DirectionalLight,
    fields: ["color", "intensity", "direction"]
  },
  MeshFilter: {
    type: MeshFilter,
    fields: ["meshRef"]  // For now
  },
  Rigidbody: {
    type: Rigidbody,
    // Missing collider
    fields: ["mass", "friction", "restitution", "linearVelocity", "linearDamping", "angularVelocity", "angularDamping", "gravityScale", "colliderType"]
  },
  FollowConstraint: {
    type: FollowConstraint,
    fields: ["rb1ID", "rb2ID", "rb1Anchor"]
  }
};


export const ComponentsView = ({ entity, editor, activeScene }) => {
  const [availableTypes, setAvailableTypes] = useState([]);

  // Missing: MeshFilter, Kinematics (FollowConstraint, Rigidbody, Collider)

  const refreshAvailableComponents = () => {
    const available = Object.keys(ComponentSpecification).filter(name => activeScene.hasComponent(entity, ComponentSpecification[name].type));
    setAvailableTypes(available);
  };

  const getUnavailableComponents = () => {
    return Object.keys(ComponentSpecification).filter(name => !activeScene.hasComponent(entity, ComponentSpecification[name].type));
  };

  const doAdd = (component) => {
    activeScene.addComponent(entity, component);
    refreshAvailableComponents();
  };

  const doRemove = (component) => {
    activeScene.removeComponent(entity, component);
    refreshAvailableComponents();
  };

  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onFrameStart" || event.name === "onSetActiveScene") {
        refreshAvailableComponents();
      }
    }

    editor.subscribe(onEngineEvent);
    return () => {
      editor.unsubscribe(onEngineEvent);
    };
  }, [entity]);  // See doc in ComponentView

  return (
    <React.Fragment>
      <div className='InspectorHeader'>
        <NiceButton className='bi bi-search controlIcon' color='green' style={{ cursor: 'default' }} noEffects disabled />
        <b>{activeScene.getComponent(entity, Tag) ? activeScene.getComponent(entity, Tag).name : 'Entity'} Inspector</b>
      </div>

      {availableTypes.map(name => {
        const { type, fields } = ComponentSpecification[name];

        return (
          !!activeScene.getComponent(entity, type) ?
            <ComponentView
              key={type}
              activeScene={activeScene}
              typename={name}
              type={type}
              entity={entity}
              fields={fields}
              removeMe={() => doRemove(type)} />
            :
            null
        );
      })}
      <Dropdown onSelect={(type) => {
        doAdd(ComponentSpecification[type].type)
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Dropdown.Toggle
            style={{
              width: '80%',
              backgroundColor: 'green',
              borderColor: 'green',
              marginTop: '5%',
              color: 'var(--bg-color)'
            }}
            variant="success"
            id="component-dropdown"
          >
            Add component
          </Dropdown.Toggle>
        </div>
        <Dropdown.Menu>
          {getUnavailableComponents().map(name => {
            return (
              <Dropdown.Item className="dropdown-item-hover" key={name} eventKey={name}>
                {name}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </React.Fragment>
  );
};
