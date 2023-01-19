# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### VTVpc <a name="VTVpc" id="vt-vpc-construct.VTVpc"></a>

#### Initializers <a name="Initializers" id="vt-vpc-construct.VTVpc.Initializer"></a>

```typescript
import { VTVpc } from 'vt-vpc-construct'

new VTVpc(parent: Stack, id: string, props: IStackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#vt-vpc-construct.VTVpc.Initializer.parameter.parent">parent</a></code> | <code>aws-cdk-lib.Stack</code> | *No description.* |
| <code><a href="#vt-vpc-construct.VTVpc.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#vt-vpc-construct.VTVpc.Initializer.parameter.props">props</a></code> | <code><a href="#vt-vpc-construct.IStackProps">IStackProps</a></code> | *No description.* |

---

##### `parent`<sup>Required</sup> <a name="parent" id="vt-vpc-construct.VTVpc.Initializer.parameter.parent"></a>

- *Type:* aws-cdk-lib.Stack

---

##### `id`<sup>Required</sup> <a name="id" id="vt-vpc-construct.VTVpc.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="vt-vpc-construct.VTVpc.Initializer.parameter.props"></a>

- *Type:* <a href="#vt-vpc-construct.IStackProps">IStackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#vt-vpc-construct.VTVpc.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="vt-vpc-construct.VTVpc.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#vt-vpc-construct.VTVpc.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="vt-vpc-construct.VTVpc.isConstruct"></a>

```typescript
import { VTVpc } from 'vt-vpc-construct'

VTVpc.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="vt-vpc-construct.VTVpc.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#vt-vpc-construct.VTVpc.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#vt-vpc-construct.VTVpc.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.Vpc</code> | API construct. |

---

##### `node`<sup>Required</sup> <a name="node" id="vt-vpc-construct.VTVpc.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="vt-vpc-construct.VTVpc.property.vpc"></a>

```typescript
public readonly vpc: Vpc;
```

- *Type:* aws-cdk-lib.aws_ec2.Vpc

API construct.

---



## Classes <a name="Classes" id="Classes"></a>

### Hello <a name="Hello" id="vt-vpc-construct.Hello"></a>

#### Initializers <a name="Initializers" id="vt-vpc-construct.Hello.Initializer"></a>

```typescript
import { Hello } from 'vt-vpc-construct'

new Hello()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#vt-vpc-construct.Hello.sayHello">sayHello</a></code> | *No description.* |

---

##### `sayHello` <a name="sayHello" id="vt-vpc-construct.Hello.sayHello"></a>

```typescript
public sayHello(): string
```




## Protocols <a name="Protocols" id="Protocols"></a>

### IStackProps <a name="IStackProps" id="vt-vpc-construct.IStackProps"></a>

- *Implemented By:* <a href="#vt-vpc-construct.IStackProps">IStackProps</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#vt-vpc-construct.IStackProps.property.costcenter">costcenter</a></code> | <code>string</code> | *No description.* |
| <code><a href="#vt-vpc-construct.IStackProps.property.environment">environment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#vt-vpc-construct.IStackProps.property.name">name</a></code> | <code>string</code> | vpc name. |
| <code><a href="#vt-vpc-construct.IStackProps.property.solutionName">solutionName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#vt-vpc-construct.IStackProps.property.cidr">cidr</a></code> | <code>string</code> | vpc cidr. |

---

##### `costcenter`<sup>Required</sup> <a name="costcenter" id="vt-vpc-construct.IStackProps.property.costcenter"></a>

```typescript
public readonly costcenter: string;
```

- *Type:* string

---

##### `environment`<sup>Required</sup> <a name="environment" id="vt-vpc-construct.IStackProps.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

---

##### `name`<sup>Required</sup> <a name="name" id="vt-vpc-construct.IStackProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* solutionName

vpc name.

---

##### `solutionName`<sup>Required</sup> <a name="solutionName" id="vt-vpc-construct.IStackProps.property.solutionName"></a>

```typescript
public readonly solutionName: string;
```

- *Type:* string

---

##### `cidr`<sup>Optional</sup> <a name="cidr" id="vt-vpc-construct.IStackProps.property.cidr"></a>

```typescript
public readonly cidr: string;
```

- *Type:* string
- *Default:* '172.16.0.0/16'

vpc cidr.

---

